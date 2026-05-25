import { getCommunesByWilayaId } from "algeria-locations";

export interface Commune {
  name: string;
}

export function fetchCommunes(wilayaCode: number): Promise<Commune[]> {
  const communes = getCommunesByWilayaId(wilayaCode) ?? [];
  return Promise.resolve(communes.map((c) => ({ name: c.name })));
}
