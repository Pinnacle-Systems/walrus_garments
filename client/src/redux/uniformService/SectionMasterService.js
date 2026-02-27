import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SECTION_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const SectionMasterApi = createApi({
    reducerPath: "SectionMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["SectionMaster"],
    endpoints: (builder) => ({
        getSectionMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: SECTION_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: SECTION_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["SectionMaster"],
        }),
        getSectionMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${SECTION_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["SectionMaster"],
        }),
        addSectionMaster: builder.mutation({
            query: (payload) => ({
                url: SECTION_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["SectionMaster"],
        }),
        updateSectionMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${SECTION_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["SectionMaster"],
        }),
        deleteSectionMaster: builder.mutation({
            query: (id) => ({
                url: `${SECTION_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["SectionMaster"],
        }),
    }),
});

export const {
    useGetSectionMasterQuery,
    useGetSectionMasterByIdQuery,
    useAddSectionMasterMutation,
    useUpdateSectionMasterMutation,
    useDeleteSectionMasterMutation,
} = SectionMasterApi;

export default SectionMasterApi;
