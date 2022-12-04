export async function getUsageLimits(){
    try {
        let data = await this.fetch.getUsageLimits();
        return data;
    }
    catch(err){
        console.log({err});
        throw new Error(err);
    }
}