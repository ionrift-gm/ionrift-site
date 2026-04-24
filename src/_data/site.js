/**
 * Global site data. Override IONRIFT_MEDIA_BASE for a different GCS bucket or prefix.
 */
export default {
  name: "Ionrift Workshop",
  url: "https://ionrift.cloud",
  author: {
    name: "The Austere Maker",
    url: "https://ionrift.cloud",
  },
  get mediaBaseUrl() {
    return (
      process.env.IONRIFT_MEDIA_BASE ||
      "https://storage.googleapis.com/ionrift-media"
    );
  },
};
