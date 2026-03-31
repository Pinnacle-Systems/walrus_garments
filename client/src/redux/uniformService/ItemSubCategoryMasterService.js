import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ITEM_SUB_CATEGORY_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ItemSubCategoryMasterApi = createApi({
    reducerPath: "ItemSubCategoryMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["ItemSubCategoryMaster"],
    endpoints: (builder) => ({
        getItemSubCategory: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: ITEM_SUB_CATEGORY_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: ITEM_SUB_CATEGORY_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["ItemSubCategoryMaster"],
        }),
        getItemSubCategoryById: builder.query({
            query: (id) => {
                return {
                    url: `${ITEM_SUB_CATEGORY_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["ItemSubCategoryMaster"],
        }),
        addItemSubCategory: builder.mutation({
            query: (payload) => ({
                url: ITEM_SUB_CATEGORY_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["ItemSubCategoryMaster"],
        }),
        updateItemSubCategory: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${ITEM_SUB_CATEGORY_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["ItemSubCategoryMaster"],
        }),
        deleteItemSubCategory: builder.mutation({
            query: (id) => ({
                url: `${ITEM_SUB_CATEGORY_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ItemSubCategoryMaster"],
        }),
    }),
});

export const {
    useGetItemSubCategoryQuery,
    useGetItemSubCategoryByIdQuery,
    useAddItemSubCategoryMutation,
    useUpdateItemSubCategoryMutation,
    useDeleteItemSubCategoryMutation,
} = ItemSubCategoryMasterApi;

export default ItemSubCategoryMasterApi;
