// // 全局共享数据示例
// import { DEFAULT_NAME } from '@/constants';
// import { useState } from 'react';

// const useUser = () => {
//   const [name, setName] = useState<string>(DEFAULT_NAME);
//   return {
//     name,
//     setName,
//   };
// };

// const useUserInfor = () => {
//   const [info, setInfo] = useState<any>({});
//   return {
//     info,
//     setInfo,
//   };
// };

// export default { useUser, useUserInfor };
// let GlobalData: any = {};

const GetGlobalData=()=>{
    const GData:any=GGMIDENDPRO.GlobalData;
    if (GData && GData.get()) {
        return GData.get();
    }
    return null;
}

export { GetGlobalData };
