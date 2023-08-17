package com.example.maven;

import static org.junit.Assert.assertFalse;
import org.junit.Test;

public class MathDiffblueTest {
  /**
  * Method under test: {@link Math#greaterThanFive(int)}
  */
  @Test
  public void testGreaterThanFive() {
    // Arrange, Act and Assert
    assertFalse(Math.greaterThanFive(1));
  }
}

