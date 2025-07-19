import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {   PARTY_CONTACT_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const partyContactMasterApi = createApi({
  reducerPath: "partyContactMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["partyBranchContactMaster"],
  endpoints: (builder) => ({
    getPartyContact: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PARTY_CONTACT_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: PARTY_CONTACT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["partyContactMaster"],
    }),
    getPartyContactById: builder.query({
      query: (id) => {
        return {
          url: `${PARTY_CONTACT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["partyContactMaster"],
    }),
    addPartyContact: builder.mutation({
      query: (payload) => ({
        url: PARTY_CONTACT_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["partyBranchContactMaster"],
    }),
    updatePartyContact: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PARTY_CONTACT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["partyBranchContactMaster"],
    }),
    deletePartyContact: builder.mutation({
      query: (id) => ({
        url: `${PARTY_CONTACT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["partyBranchContactMaster"],
    }),





  }),
});

export const {
  useGetPartyContactQuery,
  useGetPartyContactByIdQuery,
  useAddPartyContactMutation,
  useUpdatePartyContactMutation,
  useDeletePartyContactMutation,
} = partyContactMasterApi;

export default partyContactMasterApi;
