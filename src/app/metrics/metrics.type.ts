interface Temporada {
    id: string
    año: number
    fechaInicio: Date
    fechaFinal: Date
    estado: "En Proceso" | "Terminada" | "No Iniciada"
}

export type {Temporada}