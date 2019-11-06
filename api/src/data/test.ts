export default `
  package authz

  test_alice_view_my_grades {
    allow with input as {
      "scope": "section:1a",
      "permission": "view my grades",
      "user_id": "alice"
    }
  }

  test_alice_view_mis {
    allow with input as {
      "scope": "section:1a",
      "permission": "view module items",
      "user_id": "alice"
    }
  }

  test_alice_cant_view_mis_on_master_course {
    not allow with input as {
      "scope": "course:1",
      "permission": "view module items",
      "user_id": "alice"
    }
  }

  test_bob_assign_in_section {
    allow with input as {
      "scope": "section:2a",
      "permission": "assign",
      "user_id": "bob"
    }
  }

  test_edith_view_all_grades_in_courses {
    allow with input as {
      "scope": "course:1",
      "permission": "view all grades",
      "user_id": "edith"
    }
    allow with input as {
      "scope": "course:2",
      "permission": "view all grades",
      "user_id": "edith"
    }
  }
`;
