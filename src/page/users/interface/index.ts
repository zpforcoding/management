export interface DataType{
    id: string;
    name: string;
    editionId: number;
    editionName: string | null;
    companyName: string;
    isActivated: boolean;
    dueDate: string | null;
    type: number;
    totalOrderQty: number;
    todayOrderQty: number;
    latestOrderDate: string | null;
    status: number;
    area: string;
    tel?: string;
    email?: string;
    creditCode?: string;
    industryNum?: string;
    organizationCode?: string;
    legalPerson?: string;
}