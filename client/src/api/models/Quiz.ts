/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Question } from './Question';
export type Quiz = {
    id?: number;
    title?: string;
    category?: string;
    subcategory?: string;
    tags?: Array<string>;
    totalTimeMinutes?: number;
    questionsCount?: number;
    questions?: Array<Question>;
};

