export interface Translation {
  category: string;
  descriptionText: string;
  imageText: string[];
  informationText: string;
  title: string;
}

export interface Project {
  createdAt: string;
  image: boolean;
  imagesUrl: string[];
  imgCover: string;
  link: boolean;
  linkUrl: string[];
  slug: string;
  translation: {
    en: Translation;
    fr: Translation;
  };
  updatedAt: string; 
  __v: number;
  _id: string;
}
