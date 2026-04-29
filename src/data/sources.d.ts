declare module "@/data/songs.source.mjs" {
  export const SONGS_DB: Array<{
    id: string;
    title: string;
    artist: string;
    year?: number;
    type?: string;
    src: string;
  }>;
}

declare module "@/data/albums.source.mjs" {
  export const ALBUMS_DB: Array<{
    id: string;
    title: string;
    artist: string;
    year: number;
    cover: string;
    songs: Array<{
      id: string;
      title: string;
      artist: string;
      year?: number;
      type?: string;
      src: string;
    }>;
  }>;
}
