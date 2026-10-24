import { Schema } from "effect";

export const FINITE = Schema.Finite;
export const LABEL = Schema.String.check(Schema.makeFilter((value) => value.trim().length > 0));
