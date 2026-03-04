import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ITEM_CONTROL_PANEL_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ItemControlPanelApi = createApi({
    reducerPath: "ItemControlPanel",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["ItemControlPanel"],
    endpoints: (builder) => ({
        getItemControlPanelMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: ITEM_CONTROL_PANEL_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: ITEM_CONTROL_PANEL_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["ItemControlPanel"],
        }),
        getItemControlPanelMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${ITEM_CONTROL_PANEL_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["ItemControlPanel"],
        }),
        addItemControlPanelMaster: builder.mutation({
            query: (payload) => ({
                url: ITEM_CONTROL_PANEL_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["ItemControlPanel"],
        }),
        updateItemControlPanelMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${ITEM_CONTROL_PANEL_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["ItemControlPanel"],
        }),
        deleteItemControlPanelMaster: builder.mutation({
            query: (id) => ({
                url: `${ITEM_CONTROL_PANEL_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ItemControlPanel"],
        }),
    }),
});

export const {
    useGetItemControlPanelMasterQuery,
    useGetItemControlPanelMasterByIdQuery,
    useAddItemControlPanelMasterMutation,
    useUpdateItemControlPanelMasterMutation,
    useDeleteItemControlPanelMasterMutation,
} = ItemControlPanelApi;

export default ItemControlPanelApi;
