import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ITEM_CATEGORY_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ItemCategoryMasterApi = createApi({
    reducerPath: "ItemCategoryMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["ItemCategoryMaster"],
    endpoints: (builder) => ({
        getItemCategory: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: ITEM_CATEGORY_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: ITEM_CATEGORY_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["ItemCategoryMaster"],
        }),
        getItemCategoryById: builder.query({
            query: (id) => {
                return {
                    url: `${ITEM_CATEGORY_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["ItemCategoryMaster"],
        }),
        addItemCategory: builder.mutation({
            query: (payload) => ({
                url: ITEM_CATEGORY_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["ItemCategoryMaster"],
        }),
        updateItemCategory: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${ITEM_CATEGORY_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["ItemCategoryMaster"],
        }),
        deleteItemCategory: builder.mutation({
            query: (id) => ({
                url: `${ITEM_CATEGORY_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ItemCategoryMaster"],
        }),
    }),
});

export const {
    useGetItemCategoryQuery,
    useGetItemCategoryByIdQuery,
    useAddItemCategoryMutation,
    useUpdateItemCategoryMutation,
    useDeleteItemCategoryMutation,
} = ItemCategoryMasterApi;

export default ItemCategoryMasterApi;
