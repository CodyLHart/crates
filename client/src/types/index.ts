export interface Track {
  position: string;
  title: string;
  duration: string;
  artists?: string[];
  spotifyId?: string;
  bpm?: number;
  key?: number;
  mode?: string;
  energy?: number;
  danceability?: number;
  acousticness?: number;
  instrumentalness?: number;
  valence?: number;
  tempo?: number;
}

export interface Album {
  _id?: string;
  title: string;
  artist: string;
  year?: string;
  thumb?: string;
  discogsId: number;
  addedAt: string;
  genre?: string[];
  style?: string[];
  country?: string;
  format?: string[];
  label?: string;
  catno?: string;
  barcode?: string;
  tracks?: Track[];
  notes?: string;
  masterId?: number;
  status?: string;
}
