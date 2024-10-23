package com.iiitn.resell.common.event;

public final class RabbitQueues {
    private RabbitQueues() {}

    public static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    public static final String NOTIFICATION_QUEUE    = "notification.dispatch";
    public static final String NOTIFICATION_KEY      = "notification.dispatch";

    public static final String DLX                   = "notification.dlx";
    public static final String DLQ                   = "notification.dlq";
}
