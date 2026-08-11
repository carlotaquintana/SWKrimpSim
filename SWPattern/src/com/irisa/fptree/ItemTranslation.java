package com.irisa.fptree;

public class ItemTranslation {
    
    private final String uri;
    private final String type;

    
    public ItemTranslation(String uri, String type) {
        this.uri = uri;
        this.type = type;
    }

    public String getURI() {
        return uri;
    }

    public String getType() {
        return type;
    }
}