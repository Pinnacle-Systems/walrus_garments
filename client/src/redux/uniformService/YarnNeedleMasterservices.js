import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { YARN_NEEDLE_APT } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const YarnNeedleMasterApi = createApi({
  reducerPath: "YarnNeedleMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["YarnNeedleMaster"],
  endpoints: (builder) => ({
    getYarnNeedleMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: YARN_NEEDLE_APT + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: YARN_NEEDLE_APT,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["YarnNeedleMaster"],
    }),
    getYarnNeedleMasterById: builder.query({
      query: (id) => {
        return {
          url: `${YARN_NEEDLE_APT}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["YarnNeedleMaster"],
    }),
    addYarnNeedleMaster: builder.mutation({
      query: (payload) => ({
        url: YARN_NEEDLE_APT,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["YarnNeedleMaster"],
    }),
    updateYarnNeedleMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${YARN_NEEDLE_APT}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["YarnNeedleMaster"],
    }),
    deleteYarnNeedleMaster: builder.mutation({
      query: (id) => ({
        url: `${YARN_NEEDLE_APT}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["YarnNeedleMaster"],
    }),
  }),
});

export const {
  useGetYarnNeedleMasterQuery,
  useGetYarnNeedleMasterByIdQuery,
  useAddYarnNeedleMasterMutation,
  useUpdateYarnNeedleMasterMutation,
  useDeleteYarnNeedleMasterMutation,
} = YarnNeedleMasterApi;

export default YarnNeedleMasterApi;
