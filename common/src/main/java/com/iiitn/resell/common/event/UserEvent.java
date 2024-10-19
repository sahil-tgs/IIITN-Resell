package com.iiitn.resell.common.event;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserEvent {

    public enum Type { REGISTERED, UPDATED, DELETED, LOGGED_IN }

    private Type type;
    private String userId;
    private String username;
    private String email;
    private boolean admin;
    private Instant occurredAt;
}
