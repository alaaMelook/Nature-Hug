export interface Governorate {
    name_en: string,
    name_ar: string,
    slug: string,
    fees: number
    visible: boolean
}

/*
*  slug text not null,
  name_en text null,
  fees real not null default '0'::real,
  visible boolean not null default true,
  name_ar text not null,*/