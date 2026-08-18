import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ITEM_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ItemMasterApi = createApi({
    reducerPath: "itemMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["ItemMaster"],
    endpoints: (builder) => ({
        getItemMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: ITEM_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: ITEM_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["ItemMaster"],
        }),
        getItemMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${ITEM_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["ItemMaster"],
        }),
        getItemPriceList: builder.query({
            query: ({ params }) => {
                return {
                    url: `${ITEM_API}/getItemPriceList`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["ItemMaster"],
        }),
        getNextItemCode: builder.query({
            query: ({ saleType }) => ({
                url: `${ITEM_API}/next-code`,
                method: "GET",
                params: { saleType },
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
        }),

        addItemMaster: builder.mutation({
            query: (payload) => ({
                url: ITEM_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["ItemMaster"],
        }),
        updateItemMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${ITEM_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["ItemMaster"],
        }),
        deleteItemMaster: builder.mutation({
            query: (id) => ({
                url: `${ITEM_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ItemMaster"],
        }),
    }),
});

export const {
    useGetItemMasterQuery,
    useGetItemMasterByIdQuery,
    useGetItemPriceListQuery,
    useAddItemMasterMutation,
    useUpdateItemMasterMutation,
    useDeleteItemMasterMutation,
    useLazyGetNextItemCodeQuery,
} = ItemMasterApi;

export default ItemMasterApi;
