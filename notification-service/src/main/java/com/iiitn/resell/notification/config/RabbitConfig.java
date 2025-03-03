package com.iiitn.resell.notification.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.iiitn.resell.common.event.RabbitQueues;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.listener.RabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    @Bean
    public Exchange notificationExchange() {
        return ExchangeBuilder.directExchange(RabbitQueues.NOTIFICATION_EXCHANGE).durable(true).build();
    }

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(RabbitQueues.NOTIFICATION_QUEUE)
                .withArgument("x-dead-letter-exchange", RabbitQueues.DLX)
                .withArgument("x-dead-letter-routing-key", RabbitQueues.DLQ)
                .build();
    }

    @Bean
    public Binding binding() {
        return BindingBuilder.bind(notificationQueue()).to(notificationExchange())
                .with(RabbitQueues.NOTIFICATION_KEY).noargs();
    }

    @Bean
    public Exchange dlx() { return ExchangeBuilder.directExchange(RabbitQueues.DLX).durable(true).build(); }

    @Bean
    public Queue dlq() { return QueueBuilder.durable(RabbitQueues.DLQ).build(); }

    @Bean
    public Binding dlqBinding() { return BindingBuilder.bind(dlq()).to(dlx()).with(RabbitQueues.DLQ).noargs(); }

    @Bean
    public MessageConverter jsonConverter() {
        ObjectMapper m = new ObjectMapper();
        m.registerModule(new JavaTimeModule());
        return new Jackson2JsonMessageConverter(m);
    }

    @Bean
    public RabbitListenerContainerFactory<SimpleMessageListenerContainer> rabbitListenerContainerFactory(
            ConnectionFactory cf, MessageConverter conv) {
        SimpleRabbitListenerContainerFactory f = new SimpleRabbitListenerContainerFactory();
        f.setConnectionFactory(cf);
        f.setMessageConverter(conv);
        f.setDefaultRequeueRejected(false);  // failures → DLQ via retries
        return f;
    }
}
