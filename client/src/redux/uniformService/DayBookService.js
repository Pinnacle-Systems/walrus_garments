import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DAY_BOOK_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const dayBookApi = createApi({
    reducerPath: "dayBook",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["dayBook"],
    endpoints: (builder) => ({
        getDayBookSummary: builder.query({
            query: (params) => ({
                url: `${DAY_BOOK_API}/summary`,
                method: "GET",
                params
            }),
            providesTags: ["dayBook"],
        }),
        saveDayBookClosing: builder.mutation({
            query: (payload) => ({
                url: `${DAY_BOOK_API}/close`,
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["dayBook"],
        }),
    }),
});

export const {
    useGetDayBookSummaryQuery,
    useLazyGetDayBookSummaryQuery,
    useSaveDayBookClosingMutation,
} = dayBookApi;

export default dayBookApi;
