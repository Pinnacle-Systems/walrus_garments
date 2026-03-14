import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { QUOTAION_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const quotationApi = createApi({
    reducerPath: "Quotationr",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["Quotationr"],
    endpoints: (builder) => ({
        getQuotation: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: QUOTAION_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: QUOTAION_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["Quotationr"],
        }),
        getQuotationById: builder.query({
            query: (id) => {
                return {
                    url: `${QUOTAION_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["Quotationr"],
        }),
        addQuotation: builder.mutation({
            query: (payload) => ({
                url: QUOTAION_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["Quotationr"],
        }),
        updateQuotation: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${QUOTAION_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["Quotationr"],
        }),
        deleteQuotation: builder.mutation({
            query: (id) => ({
                url: `${QUOTAION_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Quotationr"],
        }),
    }),
});

export const {
    useGetQuotationQuery,
    useGetQuotationByIdQuery,
    useAddQuotationMutation,
    useUpdateQuotationMutation,
    useDeleteQuotationMutation,
} = quotationApi;

export default quotationApi;
