package com.sto.sto.entity;

import com.alibaba.fastjson.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.ResourceUtils;
import org.yaml.snakeyaml.Yaml;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.HashMap;

public class OpenApiSpec {

    private final static Logger log = LoggerFactory.getLogger(OpenApiSpec.class);

    private HashMap data = null;
    private HashMap dataInfo = null;

    private String filePath = "";
    private String encoding = "UTF-8";


    public OpenApiSpec(String filePath) {
        this.filePath = filePath;
        loadFile();
    }

    public OpenApiSpec(String filePath, String encoding) {
        this.filePath = filePath;
        this.encoding = encoding;
        loadFile();
    }

    public HashMap getData() {
        return this.data;
    }

    public HashMap getDataInfo() {
        return dataInfo;
    }

    private void loadFile() {
        String suffix = this.filePath.substring(this.filePath.length()-4);
        if("yaml".compareToIgnoreCase(suffix) == 0) {
            this.parseYaml();
        }
        else if("json".compareToIgnoreCase(suffix) == 0) {
            this.parseJson();
        }
        else {
            return;
        }

        this.formatInfo();
    }

    private void parseYaml() {
        try {
            Yaml yaml = new Yaml();
            File file = ResourceUtils.getFile(this.filePath);
            Object res = yaml.load(new FileInputStream(file));
            if(res != null) {
                this.data = (HashMap) res;
            } else {
                log.warn("error: fail to parse:" + this.filePath);
            }

        } catch (Exception e) {
            log.error(e.getMessage());
        }

    }

    private void parseJson() {
        try {
            File file = ResourceUtils.getFile(this.filePath);
            String res = this.readToString(file, this.encoding);
            if(res != null) {
                this.data = JSONObject.parseObject(res, HashMap.class);
            } else {
                log.warn("error: fail to parse:" + this.filePath);
            }
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }

    private String readToString(File file, String encoding) {
        Long length = file.length();
        byte[] content = new byte[length.intValue()];
        try {
            FileInputStream in = new FileInputStream(file);
            in.read(content);
            in.close();
        } catch (FileNotFoundException e) {
            log.error(e.getMessage());
        } catch (IOException e) {
            log.error(e.getMessage());
        }
        try {
            return new String(content, encoding);
        } catch (Exception e) {
            log.error(e.getMessage());
            return null;
        }
    }

    private void formatInfo() {
        if(this.data == null || this.data.get("info") == null) {
            log.warn("error: 'info' was not found, filepath:"+this.filePath);
            return;
        }
        this.dataInfo = (HashMap)this.data.get("info");
        if(!this.dataInfo.containsKey("x-id")) {
            this.dataInfo.put("x-id", this.filePath);
        }
    }
}
