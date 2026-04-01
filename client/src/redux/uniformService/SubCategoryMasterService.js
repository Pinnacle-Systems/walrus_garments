import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SUB_CATEGORY_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const SubCategoryMasterApi = createApi({
    reducerPath: "SubCategoryMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["SubCategoryMaster"],
    endpoints: (builder) => ({
        getSubCategory: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: SUB_CATEGORY_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: SUB_CATEGORY_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["SubCategoryMaster"],
        }),
        getSubCategoryById: builder.query({
            query: (id) => {
                return {
                    url: `${SUB_CATEGORY_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["SubCategoryMaster"],
        }),
        addSubCategory: builder.mutation({
            query: (payload) => ({
                url: SUB_CATEGORY_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["SubCategoryMaster"],
        }),
        updateSubCategory: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${SUB_CATEGORY_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["SubCategoryMaster"],
        }),
        deleteSubCategory: builder.mutation({
            query: (id) => ({
                url: `${SUB_CATEGORY_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["SubCategoryMaster"],
        }),
    }),
});

export const {
    useGetSubCategoryQuery,
    useGetSubCategoryByIdQuery,
    useAddSubCategoryMutation,
    useUpdateSubCategoryMutation,
    useDeleteSubCategoryMutation,
} = SubCategoryMasterApi;

export default SubCategoryMasterApi;
