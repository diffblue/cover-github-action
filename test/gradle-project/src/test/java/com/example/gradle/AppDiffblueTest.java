package com.example.gradle;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

class AppDiffblueTest {
  /**
  * Methods under test: 
  * 
  * <ul>
  *   <li>default or parameterless constructor of {@link App}
  *   <li>{@link App#getGreeting()}
  * </ul>
  */
  @Test
  void testConstructor() {
    // Arrange, Act and Assert
    assertEquals("Hello World!", (new App()).getGreeting());
  }
}

