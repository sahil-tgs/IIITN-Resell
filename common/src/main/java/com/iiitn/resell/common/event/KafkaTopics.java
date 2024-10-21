package com.iiitn.resell.common.event;

public final class KafkaTopics {
    private KafkaTopics() {}
    public static final String PRODUCT_EVENTS = "product.events.v1";
    public static final String USER_EVENTS    = "user.events.v1";
    public static final String CHAT_EVENTS    = "chat.events.v1";
    public static final String AUTH_EVENTS    = "auth.events.v1";
}
