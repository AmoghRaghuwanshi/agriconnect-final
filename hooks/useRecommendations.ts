'use client';

import { useMemo } from 'react';
import { useListingStore, type Listing } from '@/store/listingStore';
import { useOrderStore } from '@/store/orderStore';

/* ═══════════════════════════════════════════════════════════════════════════
   Complementary crop pairings — used for "You might also like" cross-sell.
   Each key maps to crops that pair well in Indian cooking / supply chain.
   ═══════════════════════════════════════════════════════════════════════════ */
const COMPLEMENTARY_CROPS: Record<string, string[]> = {
  'Wheat':       ['Rice', 'Soybean', 'Gram', 'Lentil'],
  'Rice':        ['Wheat', 'Lentil', 'Onion', 'Turmeric'],
  'Onion':       ['Tomato', 'Green Chili', 'Garlic', 'Potato'],
  'Tomato':      ['Onion', 'Green Chili', 'Potato', 'Garlic'],
  'Potato':      ['Onion', 'Tomato', 'Green Chili', 'Peas'],
  'Green Chili': ['Onion', 'Tomato', 'Garlic', 'Coriander'],
  'Soybean':     ['Wheat', 'Gram', 'Lentil'],
  'Garlic':      ['Onion', 'Ginger', 'Tomato'],
  'Ginger':      ['Garlic', 'Turmeric', 'Green Chili'],
  'Turmeric':    ['Ginger', 'Rice', 'Coriander'],
  'Basmati Rice':['Onion', 'Tomato', 'Soybean', 'Lentil'],
};

/* ── Types ──────────────────────────────────────────────────────────────── */
export interface RecommendedItem {
  listing: Listing;
  score: number;
  reason: 'same_farmer' | 'same_category' | 'complementary' | 'popular';
  reasonLabel: string;   // "More from Raju Farms", "Goes well together", etc.
}

export interface RecommendationGroup {
  title: string;
  icon: string;
  items: RecommendedItem[];
}

interface UseRecommendationsConfig {
  cartCropNames: string[];
  cartFarmerIds: string[];
  cartListingIds: string[];
  cartCategories?: string[];
  maxPerSection?: number;
  isB2B?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
   useRecommendations — main hook
   ═══════════════════════════════════════════════════════════════════════════ */
export function useRecommendations(config: UseRecommendationsConfig): RecommendationGroup[] {
  const { listings } = useListingStore();
  const {
    cartCropNames,
    cartFarmerIds,
    cartListingIds,
    cartCategories = [],
    maxPerSection = 6,
    isB2B = false,
  } = config;

  return useMemo(() => {
    if (cartListingIds.length === 0) return [];

    const active = listings.filter(
      (l) => l.status === 'ACTIVE' && !cartListingIds.includes(l.id)
    );

    if (active.length === 0) return [];

    // Normalize crop names for matching
    const cartCropsLower = cartCropNames.map((c) => c.toLowerCase());
    const cartCatsLower = cartCategories.map((c) => c.toLowerCase());

    // Build complementary set
    const complementarySet = new Set<string>();
    for (const crop of cartCropNames) {
      // Try exact match and first-word match
      const key = Object.keys(COMPLEMENTARY_CROPS).find(
        (k) => k.toLowerCase() === crop.toLowerCase() || crop.toLowerCase().startsWith(k.toLowerCase())
      );
      if (key) {
        for (const c of COMPLEMENTARY_CROPS[key]) {
          complementarySet.add(c.toLowerCase());
        }
      }
    }

    // Score each listing
    const scored: RecommendedItem[] = [];

    for (const listing of active) {
      let score = 0;
      let reason: RecommendedItem['reason'] = 'popular';
      let reasonLabel = 'Popular pick';

      const cropLower = listing.cropName.toLowerCase();

      // Same farmer → highest priority cross-sell
      if (cartFarmerIds.includes(listing.farmerId)) {
        score += 5;
        reason = 'same_farmer';
        const farmerName = listing.farmerName || listing.farmName || 'this farm';
        reasonLabel = `More from ${farmerName}`;
      }

      // Same category
      if (cartCatsLower.length > 0 && cartCatsLower.includes(listing.category.toLowerCase())) {
        score += 3;
        if (reason === 'popular') {
          reason = 'same_category';
          reasonLabel = `Also in ${listing.category}`;
        }
      }

      // Complementary crop
      if (complementarySet.has(cropLower)) {
        score += 4;
        if (reason !== 'same_farmer') {
          reason = 'complementary';
          reasonLabel = 'Goes well together';
        }
      }

      // Avoid duplicating crops already in cart
      if (cartCropsLower.some((c) => cropLower.includes(c) || c.includes(cropLower))) {
        score -= 2; // penalize near-duplicate
      }

      // Popularity bonus
      score += Math.min(listing.views / 50, 2);

      // Only include if score > 0
      if (score > 0) {
        scored.push({ listing, score, reason, reasonLabel });
      }
    }

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Group into sections
    const groups: RecommendationGroup[] = [];

    // 1. "More from this farm"
    const sameFarmer = scored.filter((r) => r.reason === 'same_farmer').slice(0, maxPerSection);
    if (sameFarmer.length > 0) {
      // Dedupe farmer names for the title
      const farmerNames = [...new Set(sameFarmer.map((r) => r.listing.farmerName || r.listing.farmName))];
      groups.push({
        title: farmerNames.length === 1 ? `More from ${farmerNames[0]}` : 'More from your farms',
        icon: '🧑‍🌾',
        items: sameFarmer,
      });
    }

    // 2. "You might also like" — complementary + category
    const youMightLike = scored
      .filter((r) => r.reason !== 'same_farmer')
      .slice(0, maxPerSection);
    if (youMightLike.length > 0) {
      groups.push({
        title: 'You might also like',
        icon: '✨',
        items: youMightLike,
      });
    }

    return groups;
  }, [listings, cartCropNames, cartFarmerIds, cartListingIds, cartCategories, maxPerSection, isB2B]);
}

/* ═══════════════════════════════════════════════════════════════════════════
   useWholesalerRecommendations — based on order history
   ═══════════════════════════════════════════════════════════════════════════ */
export function useWholesalerRecommendations(userId: string, maxResults = 6): RecommendationGroup[] {
  const { listings } = useListingStore();
  const { orders } = useOrderStore();

  return useMemo(() => {
    if (!userId) return [];

    const myOrders = orders.filter((o) => o.buyerId === userId);
    if (myOrders.length === 0 && listings.length === 0) return [];

    const active = listings.filter((l) => l.status === 'ACTIVE');

    // Build sets from order history
    const orderedCrops = new Set(myOrders.map((o) => o.cropName.toLowerCase()));
    const orderedFarmerIds = new Set(myOrders.map((o) => o.farmerId));

    const groups: RecommendationGroup[] = [];

    // 1. "Quick Reorder" — crops the user has ordered before, still available
    const reorderItems: RecommendedItem[] = [];
    for (const listing of active) {
      if (orderedCrops.has(listing.cropName.toLowerCase()) || orderedFarmerIds.has(listing.farmerId)) {
        reorderItems.push({
          listing,
          score: orderedFarmerIds.has(listing.farmerId) ? 5 : 3,
          reason: 'same_farmer',
          reasonLabel: orderedFarmerIds.has(listing.farmerId) ? 'Trusted supplier' : 'Previously ordered',
        });
      }
    }
    reorderItems.sort((a, b) => b.score - a.score);
    if (reorderItems.length > 0) {
      groups.push({
        title: 'Quick Reorder',
        icon: '🔄',
        items: reorderItems.slice(0, maxResults),
      });
    }

    // 2. "Related Supplies" — complementary to past orders
    const complementarySet = new Set<string>();
    for (const crop of orderedCrops) {
      const key = Object.keys(COMPLEMENTARY_CROPS).find(
        (k) => k.toLowerCase() === crop || crop.startsWith(k.toLowerCase())
      );
      if (key) {
        for (const c of COMPLEMENTARY_CROPS[key]) {
          complementarySet.add(c.toLowerCase());
        }
      }
    }

    const relatedItems: RecommendedItem[] = [];
    for (const listing of active) {
      if (complementarySet.has(listing.cropName.toLowerCase()) && !orderedCrops.has(listing.cropName.toLowerCase())) {
        relatedItems.push({
          listing,
          score: 3 + Math.min(listing.views / 50, 2),
          reason: 'complementary',
          reasonLabel: 'Goes well together',
        });
      }
    }
    relatedItems.sort((a, b) => b.score - a.score);
    if (relatedItems.length > 0) {
      groups.push({
        title: 'Related Supplies',
        icon: '📦',
        items: relatedItems.slice(0, maxResults),
      });
    }

    // 3. Fallback — popular items if no history-based results
    if (groups.length === 0 && active.length > 0) {
      const popular = active
        .sort((a, b) => b.views - a.views)
        .slice(0, maxResults)
        .map((listing) => ({
          listing,
          score: listing.views / 50,
          reason: 'popular' as const,
          reasonLabel: 'Popular in your area',
        }));
      groups.push({
        title: 'Recommended for You',
        icon: '⭐',
        items: popular,
      });
    }

    return groups;
  }, [listings, orders, userId, maxResults]);
}
