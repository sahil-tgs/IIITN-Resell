package com.iiitn.resell.search.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "products")
public class ProductDocument {

    @Id
    private String id;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String title;

    @Field(type = FieldType.Text)
    private String description;

    @Field(type = FieldType.Keyword)
    private String sellerId;

    @Field(type = FieldType.Keyword)
    private String category;

    @Field(type = FieldType.Keyword)
    private String condition;

    @Field(type = FieldType.Keyword)
    private String location;

    @Field(type = FieldType.ScaledFloat, scalingFactor = 100)
    private BigDecimal price;

    @Field(type = FieldType.Boolean)
    private boolean sold;

    @Field(type = FieldType.Keyword)
    private String imageUrl;

    @Field(type = FieldType.Date)
    private Instant indexedAt;
}
