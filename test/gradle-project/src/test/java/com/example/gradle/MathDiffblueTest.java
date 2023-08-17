package com.example.gradle;

import static org.junit.jupiter.api.Assertions.assertFalse;
import org.junit.jupiter.api.Test;

class MathDiffblueTest {
  /**
  * Method under test: {@link Math#greaterThanFive(int)}
  */
  @Test
  void testGreaterThanFive() {
    // Arrange, Act and Assert
    assertFalse(Math.greaterThanFive(1));
  }
}

