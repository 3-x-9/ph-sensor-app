import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY;

console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Key:', SUPABASE_KEY);

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function writeData(data) {
    const {data: result, error} = await supabase.from("dataHistory").insert(data);
    if (error) console.error(error);
    return result;
}
export async function fetchData(timewindow) {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() - timewindow);
    const startDateISO = startDate.toISOString();
    const endDateISO = endDate.toISOString();


    const {data, error} = await supabase
        .from("dataHistory")
        .select("*")
        .lte("createdat", startDateISO)
        .gte("createdat", endDateISO)
        .order('createdat', { ascending: true});
    if (error) console.error(error);
    console.log('Successfully fetched', {data})
    return data;
}