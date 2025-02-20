package com.iiitn.resell.chat.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.iiitn.resell.common.event.RabbitQueues;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
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
    public Binding notificationBinding() {
        return BindingBuilder.bind(notificationQueue()).to(notificationExchange())
                .with(RabbitQueues.NOTIFICATION_KEY).noargs();
    }

    @Bean
    public Exchange dlx() {
        return ExchangeBuilder.directExchange(RabbitQueues.DLX).durable(true).build();
    }

    @Bean
    public Queue dlq() {
        return QueueBuilder.durable(RabbitQueues.DLQ).build();
    }

    @Bean
    public Binding dlqBinding() {
        return BindingBuilder.bind(dlq()).to(dlx()).with(RabbitQueues.DLQ).noargs();
    }

    @Bean
    public MessageConverter jsonConverter() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return new Jackson2JsonMessageConverter(mapper);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory cf, MessageConverter conv) {
        RabbitTemplate t = new RabbitTemplate(cf);
        t.setMessageConverter(conv);
        return t;
    }
}
