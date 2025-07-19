import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {  PARTY_BRANCH_CONTACT_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const partyBranchContactMasterApi = createApi({
  reducerPath: "partyBranchContactMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["partyBranchContactMaster"],
  endpoints: (builder) => ({
    getPartyBranchContact: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PARTY_BRANCH_CONTACT_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: PARTY_BRANCH_CONTACT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["partyBranchContactMaster"],
    }),
    getPartyBranchContactById: builder.query({
      query: (id) => {
        return {
          url: `${PARTY_BRANCH_CONTACT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["partyBranchContactMaster"],
    }),
    addPartyBranchContact: builder.mutation({
      query: (payload) => ({
        url: PARTY_BRANCH_CONTACT_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["partyBranchContactMaster"],
    }),
    updatePartyBranchContact: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PARTY_BRANCH_CONTACT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["partyBranchContactMaster"],
    }),
    deletePartyBranchContact: builder.mutation({
      query: (id) => ({
        url: `${PARTY_BRANCH_CONTACT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["partyBranchContactMaster"],
    }),



        addPartyContact: builder.mutation({
      query: (payload) => ({
        url: PARTY_BRANCH_CONTACT_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["partyBranchContactMaster"],
    }),

  }),
});

export const {
  useGetPartyBranchContactQuery,
  useGetPartyBranchContactByIdQuery,
  useAddPartyBranchContactMutation,
  useUpdatePartyBranchContactMutation,
  useDeletePartyBranchContactMutation,
} = partyBranchContactMasterApi;

export default partyBranchContactMasterApi;
