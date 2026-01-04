import { useEffect, useState } from 'react';

const useInfo = () => {
    const [dataInfo, setDatainfo] = useState<any>({})
    const storedProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    useEffect(() => {
        setDatainfo(storedProfile)
    }, [])

    return { dataInfo };
};

export default useInfo;
