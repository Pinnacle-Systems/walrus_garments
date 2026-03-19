import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {  PRICE_TEMPLATE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const priceTemplateApi = createApi({
    reducerPath: "priceTemplate",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["priceTemplate"],
    endpoints: (builder) => ({
        getpriceTemplate: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: PRICE_TEMPLATE_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: PRICE_TEMPLATE_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["priceTemplate"],
        }),
        getpriceTemplateById: builder.query({
            query: (id) => {
                return {
                    url: `${PRICE_TEMPLATE_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["priceTemplate"],
        }),
        addpriceTemplate: builder.mutation({
            query: (payload) => ({
                url: PRICE_TEMPLATE_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["priceTemplate"],
        }),
        updatepriceTemplate: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${PRICE_TEMPLATE_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["priceTemplate"],
        }),
        deletepriceTemplate: builder.mutation({
            query: (id) => ({
                url: `${PRICE_TEMPLATE_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["priceTemplate"],
        }),
    }),
});

export const {
    useGetpriceTemplateQuery,
    useGetpriceTemplateByIdQuery,
    useAddpriceTemplateMutation,
    useUpdatepriceTemplateMutation,
    useDeletepriceTemplateMutation,
} = priceTemplateApi;

export default priceTemplateApi;
