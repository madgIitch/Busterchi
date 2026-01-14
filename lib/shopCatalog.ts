export type ShopCategory = {
  id: string;
  label: string;
  folder: string;
};

export type ShopItem = {
  id: string;
  name: string;
  categoryId?: string;
  image?: string;
  price?: number | null;
};

export const SHOP_CATEGORIES: ShopCategory[] = [
  { id: "banderas", label: "Banderas", folder: "banderas" },
  { id: "carteles", label: "Carteles", folder: "carteles" },
  { id: "vinilos", label: "Vinilos", folder: "vinilos" },
  { id: "accesorios", label: "Accesorios", folder: "accesorios" },
  { id: "muebles", label: "Muebles", folder: "muebles" },
  { id: "plantas", label: "Plantas", folder: "plantas" },
  { id: "iluminacion", label: "Iluminacion", folder: "iluminacion" },
  { id: "alfombras", label: "Alfombras", folder: "alfombras" },
  { id: "juguetes", label: "Juguetes", folder: "juguetes" },
  { id: "paredes", label: "Paredes", folder: "paredes" },
  { id: "ventanas", label: "Ventanas", folder: "ventanas" },
  { id: "camas", label: "Camas", folder: "camas" },
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: "flag-01", name: "Bandera 01", categoryId: "banderas" },
  { id: "poster-01", name: "Cartel 01", categoryId: "carteles" },
  { id: "vinyl-01", name: "Vinilo 01", categoryId: "vinilos" },
  { id: "acc-01", name: "Accesorio 01", categoryId: "accesorios" },
  { id: "furn-01", name: "Mueble 01", categoryId: "muebles" },
  { id: "plant-01", name: "Planta 01", categoryId: "plantas" },
  { id: "light-01", name: "Lampara 01", categoryId: "iluminacion" },
  { id: "rug-01", name: "Alfombra 01", categoryId: "alfombras" },
  { id: "toy-01", name: "Juguete 01", categoryId: "juguetes" },
  { id: "wall-01", name: "Pared 01", categoryId: "paredes" },
  { id: "window-01", name: "Ventana 01", categoryId: "ventanas" },
  { id: "bed-01", name: "Cama 01", categoryId: "camas" },
];
