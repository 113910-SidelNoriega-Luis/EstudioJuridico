export interface DatosMes {
  mes: number; // 0-11
  anio: number;
  nombre: string; // "Enero 2026"
  totalCasos: number;
  casosNuevos: number;
  casosCerrados: number;
  casosEnProceso: number;
  semanas: SemanaDetalle[];
}

export interface SemanaDetalle {
  nombre: string; // "Semana 1 (01-07 Ene)"
  casosNuevos: number;
  casosCerrados: number;
  casosEnProceso: number;
  total: number;
}

export const DATOS_CASOS_POR_MES: DatosMes[] = [
  {
    mes: 0,
    anio: 2026,
    nombre: 'Enero 2026',
    totalCasos: 38,
    casosNuevos: 14,
    casosCerrados: 11,
    casosEnProceso: 13,
    semanas: [
      {
        nombre: 'Semana 1 (01-07 Ene)',
        casosNuevos: 5,
        casosCerrados: 2,
        casosEnProceso: 4,
        total: 11,
      },
      {
        nombre: 'Semana 2 (08-14 Ene)',
        casosNuevos: 3,
        casosCerrados: 4,
        casosEnProceso: 2,
        total: 9,
      },
      {
        nombre: 'Semana 3 (15-21 Ene)',
        casosNuevos: 4,
        casosCerrados: 3,
        casosEnProceso: 5,
        total: 12,
      },
      {
        nombre: 'Semana 4 (22-31 Ene)',
        casosNuevos: 2,
        casosCerrados: 2,
        casosEnProceso: 2,
        total: 6,
      },
    ],
  },
  {
    mes: 1,
    anio: 2026,
    nombre: 'Febrero 2026',
    totalCasos: 29,
    casosNuevos: 10,
    casosCerrados: 12,
    casosEnProceso: 7,
    semanas: [
      {
        nombre: 'Semana 1 (01-07 Feb)',
        casosNuevos: 2,
        casosCerrados: 5,
        casosEnProceso: 1,
        total: 8,
      },
      {
        nombre: 'Semana 2 (08-14 Feb)',
        casosNuevos: 4,
        casosCerrados: 3,
        casosEnProceso: 3,
        total: 10,
      },
      {
        nombre: 'Semana 3 (15-21 Feb)',
        casosNuevos: 3,
        casosCerrados: 2,
        casosEnProceso: 2,
        total: 7,
      },
      {
        nombre: 'Semana 4 (22-28 Feb)',
        casosNuevos: 1,
        casosCerrados: 2,
        casosEnProceso: 1,
        total: 4,
      },
    ],
  },
  {
    mes: 2,
    anio: 2026,
    nombre: 'Marzo 2026',
    totalCasos: 44,
    casosNuevos: 18,
    casosCerrados: 9,
    casosEnProceso: 17,
    semanas: [
      {
        nombre: 'Semana 1 (01-07 Mar)',
        casosNuevos: 6,
        casosCerrados: 3,
        casosEnProceso: 5,
        total: 14,
      },
      {
        nombre: 'Semana 2 (08-14 Mar)',
        casosNuevos: 7,
        casosCerrados: 2,
        casosEnProceso: 6,
        total: 15,
      },
      {
        nombre: 'Semana 3 (15-21 Mar)',
        casosNuevos: 3,
        casosCerrados: 3,
        casosEnProceso: 4,
        total: 10,
      },
      {
        nombre: 'Semana 4 (22-31 Mar)',
        casosNuevos: 2,
        casosCerrados: 1,
        casosEnProceso: 2,
        total: 5,
      },
    ],
  },
  {
    mes: 3,
    anio: 2026,
    nombre: 'Abril 2026',
    totalCasos: 31,
    casosNuevos: 11,
    casosCerrados: 14,
    casosEnProceso: 6,
    semanas: [
      {
        nombre: 'Semana 1 (01-07 Abr)',
        casosNuevos: 3,
        casosCerrados: 4,
        casosEnProceso: 2,
        total: 9,
      },
      {
        nombre: 'Semana 2 (08-14 Abr)',
        casosNuevos: 4,
        casosCerrados: 5,
        casosEnProceso: 1,
        total: 10,
      },
      {
        nombre: 'Semana 3 (15-21 Abr)',
        casosNuevos: 2,
        casosCerrados: 3,
        casosEnProceso: 2,
        total: 7,
      },
      {
        nombre: 'Semana 4 (22-30 Abr)',
        casosNuevos: 2,
        casosCerrados: 2,
        casosEnProceso: 1,
        total: 5,
      },
    ],
  },
  {
    mes: 4,
    anio: 2026,
    nombre: 'Mayo 2026',
    totalCasos: 52,
    casosNuevos: 22,
    casosCerrados: 18,
    casosEnProceso: 12,
    semanas: [
      {
        nombre: 'Semana 1 (01-07 May)',
        casosNuevos: 7,
        casosCerrados: 5,
        casosEnProceso: 3,
        total: 15,
      },
      {
        nombre: 'Semana 2 (08-14 May)',
        casosNuevos: 6,
        casosCerrados: 4,
        casosEnProceso: 4,
        total: 14,
      },
      {
        nombre: 'Semana 3 (15-21 May)',
        casosNuevos: 5,
        casosCerrados: 6,
        casosEnProceso: 3,
        total: 14,
      },
      {
        nombre: 'Semana 4 (22-31 May)',
        casosNuevos: 4,
        casosCerrados: 3,
        casosEnProceso: 2,
        total: 9,
      },
    ],
  },
  {
    mes: 5,
    anio: 2026,
    nombre: 'Junio 2026',
    totalCasos: 19,
    casosNuevos: 6,
    casosCerrados: 10,
    casosEnProceso: 3,
    semanas: [
      {
        nombre: 'Semana 1 (01-07 Jun)',
        casosNuevos: 2,
        casosCerrados: 3,
        casosEnProceso: 1,
        total: 6,
      },
      {
        nombre: 'Semana 2 (08-14 Jun)',
        casosNuevos: 1,
        casosCerrados: 4,
        casosEnProceso: 0,
        total: 5,
      },
      {
        nombre: 'Semana 3 (15-21 Jun)',
        casosNuevos: 2,
        casosCerrados: 2,
        casosEnProceso: 1,
        total: 5,
      },
      {
        nombre: 'Semana 4 (22-30 Jun)',
        casosNuevos: 1,
        casosCerrados: 1,
        casosEnProceso: 1,
        total: 3,
      },
    ],
  },
];
