const BIG_DEAL_THRESHOLD = 70; // %70+

export async function getEpicDeals() {
  const items = [];

  try {
    const res = await fetch(
      "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=en-US&country=US"
    );
    const json = await res.json();

    const games =
      json?.data?.Catalog?.searchStore?.elements || [];

    for (const g of games) {
      const promo =
        g.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0];

      if (!promo) continue;

      const discount =
        promo.discountSetting?.discountPercentage;

      const baseItem = {
        source: "Epic Games",
        link: `https://store.epicgames.com/p/${g.productSlug}`,
        timestamp: promo.startDate,

        // SABİT METADATA
        category: "games",
        trust: 0.95
      };

      // %100 ücretsiz
      if (discount === 0) {
        items.push({
          ...baseItem,
          title: g.title,
          type: "free-games"
        });
      }

      // Büyük indirim
      if (discount >= BIG_DEAL_THRESHOLD) {
        items.push({
          ...baseItem,
          title: `${g.title} (%${discount})`,
          type: "big-deals"
        });
      }
    }
  } catch {
    // sessiz geç
  }

  return items;
}
