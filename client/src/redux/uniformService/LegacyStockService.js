import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LEGACY_STOCK_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const LegacyStockApi = createApi({
    reducerPath: "LegacyStock",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["LegacyStock"],
    endpoints: (builder) => ({
        getLegacyStock: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: LEGACY_STOCK_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: LEGACY_STOCK_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["LegacyStock"],
        }),
        getLegacyStockById: builder.query({
            query: (id) => {
                return {
                    url: `${LEGACY_STOCK_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["LegacyStock"],
        }),
        addLegacyStock: builder.mutation({
            query: (payload) => ({
                url: LEGACY_STOCK_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["LegacyStock"],
        }),
        updateLegacyStock: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${LEGACY_STOCK_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["LegacyStock"],
        }),
        deleteLegacyStock: builder.mutation({
            query: (id) => ({
                url: `${LEGACY_STOCK_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["LegacyStock"],
        }),
    }),
});

export const {
    useGetLegacyStockQuery,
    useGetLegacyStockByIdQuery,
    useAddLegacyStockMutation,
    useUpdateLegacyStockMutation,
    useDeleteLegacyStockMutation,
} = LegacyStockApi;

export default LegacyStockApi;
