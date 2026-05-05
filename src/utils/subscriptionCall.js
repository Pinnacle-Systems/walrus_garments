import axios from "axios";

export async function getSubscriptionDetails() {
    try {
        const response = await axios.get(process.env.SUBSCRIPTION_URL, {
            params: {
                name: 'WALRUS'
            }
        })
        const result = response?.data;

        console.log(result, "result")

        if (result.statusCode === 1) {
            return result;
        }
    } catch (e) {
        return { statusCode: 1, message: "Licensing Server is Down...!!!" }
    }
}