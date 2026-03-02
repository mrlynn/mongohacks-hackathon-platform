export interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
    download_location: string;
  };
}

export interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

export interface UnsplashSearchResult {
  id: string;
  width: number;
  height: number;
  description: string | null;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    profileUrl: string;
  };
  photoUrl: string;
  downloadLocation: string;
}
