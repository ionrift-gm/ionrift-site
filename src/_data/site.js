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
  get year() {
    return new Date().getFullYear();
  },
  /** GA4 measurement ID. Only loaded after the visitor accepts analytics (see _includes/consent-head.njk). */
  gaId: "G-65B9N0FZC0",
  contactEmail: "ionrift.gm@gmail.com",
  patreonUrl: "https://www.patreon.com/c/Ionrift",
  youtube: "https://www.youtube.com/@IonRift-workshop",
  patreonPackCollectionUrl:
    "https://www.patreon.com/collection/2079931?view=expanded",
  myContentUrl: "https://ionrift.cloud/overlay-shelf/",
  overlayShelfUrl: "https://ionrift.cloud/overlay-shelf/",
};
