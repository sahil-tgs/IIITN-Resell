package com.iiitn.resell.analytics.config;

import com.iiitn.resell.common.event.ChatEvent;
import com.iiitn.resell.common.event.ProductEvent;
import com.iiitn.resell.common.event.UserEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

/**
 * Per-event-type listener containers so each Kafka topic can deserialize
 * into the right common event class without runtime type headers.
 */
@EnableKafka
@Configuration
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers:localhost:29092}")
    private String bootstrap;

    private <T> ConsumerFactory<String, T> factoryFor(Class<T> type) {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrap);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "analytics-service");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        props.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class);
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "com.iiitn.resell.common.event");
        props.put(JsonDeserializer.VALUE_DEFAULT_TYPE, type.getName());
        props.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);
        return new DefaultKafkaConsumerFactory<>(props);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, UserEvent> userEventListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, UserEvent> f = new ConcurrentKafkaListenerContainerFactory<>();
        f.setConsumerFactory(factoryFor(UserEvent.class));
        return f;
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, ProductEvent> productEventListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, ProductEvent> f = new ConcurrentKafkaListenerContainerFactory<>();
        f.setConsumerFactory(factoryFor(ProductEvent.class));
        return f;
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, ChatEvent> chatEventListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, ChatEvent> f = new ConcurrentKafkaListenerContainerFactory<>();
        f.setConsumerFactory(factoryFor(ChatEvent.class));
        return f;
    }
}
