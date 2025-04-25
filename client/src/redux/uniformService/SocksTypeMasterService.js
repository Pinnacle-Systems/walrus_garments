import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SOCKS_TYPE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const SocksTypeApi = createApi({
    reducerPath: "socksType",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["SocksType"],
    endpoints: (builder) => ({
        getSocksType: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: SOCKS_TYPE_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: SOCKS_TYPE_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["SocksType"],
        }),
        getSocksTypeById: builder.query({
            query: (id) => {
                return {
                    url: `${SOCKS_TYPE_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["SocksType"],
        }),
        addSocksType: builder.mutation({
            query: (payload) => ({
                url: SOCKS_TYPE_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["SocksType"],
        }),
        updateSocksType: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${SOCKS_TYPE_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["SocksType"],
        }),
        deleteSocksType: builder.mutation({
            query: (id) => ({
                url: `${SOCKS_TYPE_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["SocksType"],
        }),
    }),
});

export const {
    useGetSocksTypeQuery,
    useGetSocksTypeByIdQuery,
    useAddSocksTypeMutation,
    useUpdateSocksTypeMutation,
    useDeleteSocksTypeMutation,
} = SocksTypeApi;

export default SocksTypeApi;
