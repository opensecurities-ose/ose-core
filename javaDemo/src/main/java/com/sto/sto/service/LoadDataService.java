package com.sto.sto.service;

import com.sto.sto.entity.OpenApiSpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;

import java.io.File;
import java.util.HashMap;
import java.util.TreeMap;

@Service
public class LoadDataService {
    private final static Logger log = LoggerFactory.getLogger(LoadDataService.class);

    @Value("${web.files}")
    private String files;

    public TreeMap<Object, HashMap> loadData() {
        TreeMap<Object, HashMap> apis = new TreeMap<>();
        try {
            String dataDir = files + "data/";
            log.debug("files data path:"+dataDir);
            File file = ResourceUtils.getFile(dataDir);
            if(!file.exists()){
                return apis;
            }
            File[] files = file.listFiles();
            if(files != null){
                for(File childFile:files){
                    String fileName = childFile.getName();
                    OpenApiSpec api = new OpenApiSpec(dataDir+fileName);
                    HashMap info = api.getDataInfo();
                    if(info != null) {
                        info.put("filename", fileName);
                        apis.put(info.get("x-id"), info);
                    }

                }
            }
        } catch (Exception e) {
            log.error(e.getMessage());
            e.printStackTrace();
        }

        return apis;
    }

}
