import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PARTY_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const partyMasterApi = createApi({
  reducerPath: "partyMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Party"],
  endpoints: (builder) => ({
    getParty: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PARTY_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: PARTY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Party"],
    }),
    getPartyById: builder.query({
      query: (id) => {
        return {
          url: `${PARTY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Party"],
    }),
     getPartyMaterialById: builder.query({
      query: (id) => {
        return {
          url: `${PARTY_API}/${id}/materialId`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Party"],
    }),
        getPartyContactById: builder.query({
      query: (id) => {
        return {
          url: `${PARTY_API}/${id}/contactId`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Party"],
    }),
    getPartyBranchById: builder.query({
      query: (id) => {
        return {
          url: `${PARTY_API}/${id}/partybranch`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Party"],
    }),
    addParty: builder.mutation({
      query: (payload) => ({
        url: PARTY_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Party"],
    }),
    addPartykyc: builder.mutation({
      query: (payload) => ({
        url: `${PARTY_API}/kycForm`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Party"],
    }),
    upload: builder.mutation({
      query: (payload) => {
        const { id, body } = payload;
        return {
          url: `${PARTY_API}/upload/${id}`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["Party"],
    }),
    updateParty: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${PARTY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Party"],
    }),
        updatePartyMaterial: builder.mutation({
      query: ({ materialId, body }) => {
        return {
          url: `${PARTY_API}/${materialId}/materialId`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Party"],
    }),
      updatePartyContact: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${PARTY_API}/${id}/contactId`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Party"],
    }),
    deleteParty: builder.mutation({
      query: (id) => ({
        url: `${PARTY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Party"],
    }),
    deletePartyBranch: builder.mutation({
      query: (partyBranchId) => ({
        url: `${PARTY_API}/${partyBranchId}/"partybranch"`,
        method: "DELETE",
      }),
      invalidatesTags: ["Party"],
    }),
      deletePartyMaterial: builder.mutation({
      query: (materialId) => ({
        url: `${PARTY_API}/${materialId}/material`,
        method: "DELETE",
      }),
      invalidatesTags: ["Party"],
    }),
       deletePartyContact: builder.mutation({
      query: (id) => ({
        url: `${PARTY_API}/${id}/contactId`,
        method: "DELETE",
      }),
      invalidatesTags: ["Party"],
    }),
  }),
});

export const {
  useGetPartyQuery,

  useGetPartyByIdQuery,
  useGetPartyBranchByIdQuery,
  useGetPartyMaterialByIdQuery,
  useGetPartyContactByIdQuery,

  useAddPartyMutation,
  useAddPartykycMutation,

  useUpdatePartyMutation,
  useUpdatePartyMaterialMutation,
  useUpdatePartyContactMutation,

  useDeletePartyMutation,
  useDeletePartyBranchMutation,
  useDeletePartyMaterialMutation,
  useDeletePartyContactMutation,
  useUploadMutation,
} = partyMasterApi;

export default partyMasterApi;
