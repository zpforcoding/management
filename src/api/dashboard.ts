import { get } from "../utils/http/request";

export function getEnergyData(){
    return get("/energyData")
}

export function getOrderSplitData(){
    return get("/orderSplitData")
}