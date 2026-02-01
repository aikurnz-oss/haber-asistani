export const SOURCES = [
  {
    id: "bbc-world",
    name: "BBC",
    feed: "https://feeds.bbci.co.uk/news/world/rss.xml",
    category: "global",
    trust: 0.9
  },
  {
    id: "reuters-world",
    name: "Reuters",
    feed: "https://feeds.reuters.com/Reuters/worldNews",
    category: "global",
    trust: 0.95
  },
  {
    id: "bbc-turkey",
    name: "BBC Türkçe",
    feed: "https://feeds.bbci.co.uk/turkce/rss.xml",
    category: "turkey",
    trust: 0.9
  },
  {
    id: "aa-ekonomi",
    name: "Anadolu Ajansı",
    feed: "https://www.aa.com.tr/tr/rss/ekonomi",
    category: "turkey",
    trust: 0.85
  },
  {
    id: "cointelegraph",
    name: "Cointelegraph",
    feed: "https://cointelegraph.com/rss",
    category: "crypto",
    trust: 0.85
  },
  {
    id: "epic-free",
    name: "Epic Games",
    category: "games",
    trust: 0.95
  }
];

export const DEFAULT_CONFIG = {
  maxItemsPerSource: 15
};
