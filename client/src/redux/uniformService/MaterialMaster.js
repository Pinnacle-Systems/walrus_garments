import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CLASS_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const MaterialMasterApi = createApi({
    reducerPath: "MaterialMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["MaterialMaster"],
    endpoints: (builder) => ({
        getMaterialMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: CLASS_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: CLASS_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["MaterialMaster"],
        }),
        getMaterialMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${CLASS_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["MaterialMaster"],
        }),
        addMaterialMaster: builder.mutation({
            query: (payload) => ({
                url: CLASS_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["MaterialMaster"],
        }),
        updateMaterialMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${CLASS_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["MaterialMaster"],
        }),
        deleteMaterialMaster: builder.mutation({
            query: (id) => ({
                url: `${CLASS_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["MaterialMaster"],
        }),
    }),
});

export const {
    useGetClassMasterQuery,
    useGetClassMasterByIdQuery,
    useAddClassMasterMutation,
    useUpdateClassMasterMutation,
    useDeleteClassMasterMutation,
} = MaterialMasterApi;

export default MaterialMasterApi;
